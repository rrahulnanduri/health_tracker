
import fs from 'fs';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env for local run
import dotenv from 'dotenv';
dotenv.config();

// Connect to DB
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const sql = postgres(connectionString, { ssl: 'require' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'reference_ranges.json');

async function importData() {
    try {
        console.log(`Reading data from ${jsonPath}...`);
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);

        console.log(`Found ${data.tests.length} tests to import.`);

        let successCount = 0;
        let errorCount = 0;

        for (const test of data.tests) {
            const ranges = test.ranges || {};

            // Flatten the nested ranges object
            // Priority: adult_male/adult_female -> adult -> null

            const record = {
                test_name: test.test_name,
                aliases: test.aliases || [],
                category: test.category,
                unit: test.unit,
                source: "Imported from JSON",

                // Generic Adult (fallback or base)
                optimal_min: ranges.adult?.optimal_min ?? null,
                optimal_max: ranges.adult?.optimal_max ?? null,
                normal_min: ranges.adult?.normal_min ?? null,
                normal_max: ranges.adult?.normal_max ?? null,
                borderline_low: ranges.adult?.borderline_low ?? null,
                borderline_high: ranges.adult?.borderline_high ?? null,
                critical_low: ranges.adult?.critical_low ?? null,
                critical_high: ranges.adult?.critical_high ?? null,

                // Male specific
                male_optimal_min: ranges.adult_male?.optimal_min ?? null,
                male_optimal_max: ranges.adult_male?.optimal_max ?? null,
                male_normal_min: ranges.adult_male?.normal_min ?? null,
                male_normal_max: ranges.adult_male?.normal_max ?? null,
                male_critical_low: ranges.adult_male?.critical_low ?? null,
                male_critical_high: ranges.adult_male?.critical_high ?? null,

                // Female specific
                female_optimal_min: ranges.adult_female?.optimal_min ?? null,
                female_optimal_max: ranges.adult_female?.optimal_max ?? null,
                female_normal_min: ranges.adult_female?.normal_min ?? null,
                female_normal_max: ranges.adult_female?.normal_max ?? null,
                female_critical_low: ranges.adult_female?.critical_low ?? null,
                female_critical_high: ranges.adult_female?.critical_high ?? null,
            };

            // Use UPSERT (Insert or Update)
            await sql`
                INSERT INTO reference_ranges ${sql(record)}
                ON CONFLICT (test_name) DO UPDATE SET
                    aliases = EXCLUDED.aliases,
                    category = EXCLUDED.category,
                    unit = EXCLUDED.unit,
                    source = EXCLUDED.source,
                    
                    optimal_min = EXCLUDED.optimal_min,
                    optimal_max = EXCLUDED.optimal_max,
                    normal_min = EXCLUDED.normal_min,
                    normal_max = EXCLUDED.normal_max,
                    borderline_low = EXCLUDED.borderline_low,
                    borderline_high = EXCLUDED.borderline_high,
                    critical_low = EXCLUDED.critical_low,
                    critical_high = EXCLUDED.critical_high,
                    
                    male_optimal_min = EXCLUDED.male_optimal_min,
                    male_optimal_max = EXCLUDED.male_optimal_max,
                    male_normal_min = EXCLUDED.male_normal_min,
                    male_normal_max = EXCLUDED.male_normal_max,
                    male_critical_low = EXCLUDED.male_critical_low,
                    male_critical_high = EXCLUDED.male_critical_high,

                    female_optimal_min = EXCLUDED.female_optimal_min,
                    female_optimal_max = EXCLUDED.female_optimal_max,
                    female_normal_min = EXCLUDED.female_normal_min,
                    female_normal_max = EXCLUDED.female_normal_max,
                    female_critical_low = EXCLUDED.female_critical_low,
                    female_critical_high = EXCLUDED.female_critical_high
            `;

            process.stdout.write('.');
            successCount++;
        }

        console.log(`\n\nImport complete!`);
        console.log(`Successfully imported/updated: ${successCount}`);

    } catch (err) {
        console.error('\nImport failed:', err);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

importData();
