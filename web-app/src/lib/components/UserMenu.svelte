<script lang="ts">
    import UserButton from "clerk-sveltekit/client/UserButton.svelte";
</script>

<div class="fixed top-4 right-4 z-50">
    <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
            elements: {
                avatarBox:
                    "w-10 h-10 ring-2 ring-indigo-500/50 hover:ring-indigo-400",
            },
        }}
    />
</div>
