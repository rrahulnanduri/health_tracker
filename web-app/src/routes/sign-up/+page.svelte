<script lang="ts">
    import SignUp from "clerk-sveltekit/client/SignUp.svelte";
</script>

<div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
>
    <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Health Tracker</h1>
            <p class="text-slate-400">
                Create an account to view your health data
            </p>
        </div>

        <!-- Clerk Sign Up Component -->
        <div class="flex justify-center">
            <SignUp
                redirectUrl="/"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-slate-800 border border-slate-700 shadow-2xl",
                        headerTitle: "text-white",
                        headerSubtitle: "text-slate-400",
                        formFieldLabel: "text-slate-300",
                        formFieldInput:
                            "bg-slate-700 border-slate-600 text-white",
                        formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
                        footerActionLink:
                            "text-indigo-400 hover:text-indigo-300",
                    },
                }}
            />
        </div>
    </div>
</div>
