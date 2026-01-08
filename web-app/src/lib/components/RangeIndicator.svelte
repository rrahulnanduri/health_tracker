<script lang="ts">
    let {
        value,
        min,
        max,
    }: {
        value: number;
        min: number;
        max: number;
    } = $props();

    // Calculate percentages for positioning
    // We want min to be at 20% and max at 80% to allow space for out-of-bounds values
    let rangeSpread = $derived(max - min);
    let padding = $derived(rangeSpread * 0.33); // 1/3 of range as padding on each side
    let graphMin = $derived(min - padding);
    let graphMax = $derived(max + padding);
    let totalGraphSpread = $derived(graphMax - graphMin);

    function getPercent(val: number) {
        if (totalGraphSpread === 0) return 50;
        let p = ((val - graphMin) / totalGraphSpread) * 100;
        return Math.max(0, Math.min(100, p));
    }

    let minPercent = $derived(getPercent(min));
    let maxPercent = $derived(getPercent(max));
    let valPercent = $derived(getPercent(value));

    let isAbnormal = $derived(value < min || value > max);
</script>

<div
    class="w-full max-w-[120px] h-6 flex items-center relative select-none"
    title="Range: {min} - {max}"
>
    <!-- Background Track -->
    <div class="absolute w-full h-1 bg-slate-200 rounded-full"></div>

    <!-- Safe Range Bar -->
    <div
        class="absolute h-1 bg-slate-300 rounded-full"
        style="left: {minPercent}%; width: {maxPercent - minPercent}%;"
    ></div>

    <!-- Value Dot -->
    <div
        class="absolute w-2.5 h-2.5 rounded-full border border-white shadow-sm transition-all duration-500"
        class:bg-emerald-500={!isAbnormal}
        class:bg-red-500={isAbnormal}
        style="left: {valPercent}%; transform: translateX(-50%);"
    ></div>
</div>
