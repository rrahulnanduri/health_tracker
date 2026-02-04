<script lang="ts">
    import type { PageData } from "./$types";
    import { enhance } from "$app/forms";

    export let data: PageData;

    $: pendingUsers = data.authUsers.filter((u) => !u.user_id);
    $: linkedUsers = data.authUsers.filter((u) => u.user_id);
</script>

<div class="min-h-screen bg-slate-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <header class="mb-8 flex justify-between items-center">
            <div>
                <h1
                    class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                >
                    User Management
                </h1>
                <p class="text-slate-400 mt-2">
                    Link Clerk accounts to Patient Records
                </p>
            </div>
            <div class="text-sm text-slate-500">
                Total Users: {data.authUsers.length}
            </div>
        </header>

        <!-- Section: Pending Users -->
        <section class="mb-12">
            <h2
                class="text-xl font-semibold mb-4 text-orange-400 flex items-center gap-2"
            >
                <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                Pending Verification ({pendingUsers.length})
            </h2>

            {#if pendingUsers.length === 0}
                <div
                    class="bg-slate-800/50 rounded-lg p-6 text-center text-slate-500 border border-slate-700 border-dashed"
                >
                    No pending users found.
                </div>
            {:else}
                <div class="grid gap-4">
                    {#each pendingUsers as user (user.id)}
                        <div
                            class="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6"
                        >
                            <div class="flex-1">
                                <div class="font-medium text-lg">
                                    {user.email}
                                </div>
                                <div
                                    class="text-xs text-slate-500 font-mono mt-1"
                                >
                                    Clerk ID: {user.clerk_id}
                                </div>
                                <div class="text-xs text-slate-400 mt-1">
                                    Joined: {new Date(
                                        user.created_at,
                                    ).toLocaleDateString()}
                                </div>
                            </div>

                            <div
                                class="flex items-center gap-4 w-full md:w-auto"
                            >
                                <!-- Option 1: Link to Existing -->
                                <form
                                    method="POST"
                                    action="?/link"
                                    use:enhance
                                    class="flex gap-2 items-center"
                                >
                                    <input
                                        type="hidden"
                                        name="auth_users_id"
                                        value={user.id}
                                    />
                                    <select
                                        name="user_id"
                                        class="bg-slate-700 border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value=""
                                            >Select existing patient...</option
                                        >
                                        {#each data.patients as patient}
                                            <option value={patient.id}
                                                >{patient.name} (ID: {patient.id})</option
                                            >
                                        {/each}
                                    </select>
                                    <button
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
                                    >
                                        Link
                                    </button>
                                </form>

                                <span class="text-slate-600">or</span>

                                <!-- Option 2: Create New -->
                                <form
                                    method="POST"
                                    action="?/create_and_link"
                                    use:enhance
                                    class="flex gap-2 items-center"
                                >
                                    <input
                                        type="hidden"
                                        name="auth_users_id"
                                        value={user.id}
                                    />
                                    <input
                                        type="text"
                                        name="patient_name"
                                        placeholder="New Patient Name"
                                        class="bg-slate-700 border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        required
                                    />
                                    <button
                                        class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
                                    >
                                        Create & Link
                                    </button>
                                </form>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </section>

        <!-- Section: Linked Users -->
        <section>
            <h2
                class="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2"
            >
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Linked Users ({linkedUsers.length})
            </h2>

            <div
                class="bg-slate-800 rounded-lg overflow-hidden border border-slate-700"
            >
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-900/50 text-slate-400">
                            <tr>
                                <th class="p-4 font-medium">Email</th>
                                <th class="p-4 font-medium">Linked Patient</th>
                                <th class="p-4 font-medium">Role</th>
                                <th class="p-4 font-medium">Status</th>
                                <th class="p-4 font-medium text-right"
                                    >Actions</th
                                >
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700">
                            {#each linkedUsers as user (user.id)}
                                <tr
                                    class="hover:bg-slate-700/30 transition-colors"
                                >
                                    <td class="p-4">
                                        <div class="font-medium text-white">
                                            {user.email}
                                        </div>
                                        <div
                                            class="text-xs text-slate-500 font-mono mt-0.5"
                                        >
                                            {user.clerk_id.slice(0, 15)}...
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        {#if user.patient_name}
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <div
                                                    class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold"
                                                >
                                                    {user.patient_name[0].toUpperCase()}
                                                </div>
                                                <span>{user.patient_name}</span>
                                            </div>
                                        {:else}
                                            <span class="text-red-400"
                                                >Unknown (ID: {user.user_id})</span
                                            >
                                        {/if}
                                    </td>
                                    <td class="p-4">
                                        <span
                                            class={`px-2 py-0.5 rounded text-xs font-medium ${user.role === "superuser" ? "bg-purple-500/20 text-purple-400" : "bg-slate-600/30 text-slate-400"}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        {#if user.is_verified}
                                            <span
                                                class="text-emerald-400 flex items-center gap-1.5"
                                            >
                                                <svg
                                                    class="w-3.5 h-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Verified
                                            </span>
                                        {:else}
                                            <span class="text-orange-400"
                                                >Pending</span
                                            >
                                        {/if}
                                    </td>
                                    <td class="p-4 text-right">
                                        <form
                                            method="POST"
                                            action="?/unlink"
                                            use:enhance
                                            class="inline-block"
                                        >
                                            <input
                                                type="hidden"
                                                name="auth_users_id"
                                                value={user.id}
                                            />
                                            <button
                                                disabled={user.role ===
                                                    "superuser"}
                                                class="text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={user.role === "superuser"
                                                    ? "Cannot unlink superuser"
                                                    : "Unlink user"}
                                            >
                                                Unlink
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</div>
