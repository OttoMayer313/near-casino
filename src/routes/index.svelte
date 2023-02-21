<script context="module" lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/alert';
	import { AppwriteService, type Profile } from '$lib/appwrite';
	import Loading from '$lib/Loading.svelte';

	export async function load(request: any) {
		// Using SSR auth cookies (from hook.ts)
		if (request.session.authCookie) {
			AppwriteService.setSSR(request.session.authCookie);
		}

		try {
			// Get Appwrite User + profile (Appwrite Document)
			const account = await AppwriteService.getAccount();
			const profile = await AppwriteService.getProfile(account.$id);

			// If signed it, redirect to casino route
			return {
				status: 302,
				redirect: '/casino'
			};
		} catch (err: any) {
			// No worries, we dont need any of that
		}

		return {};
	}
</script>

<script lang="ts">
	let registering = false;
	async function onRegister() {
		if (registering) {
			return;
		}

		registering = true;

		try {
			await AppwriteService.createAccount();
			await goto('/casino');
		} catch (err: any) {
			Alert.warning(err.message ? err.message : err);
		} finally {
			registering = false;
		}
	}
</script>

<div class="w-full min-h-[100vh] py-10 px-2 bg-brand-50">
	<div class="max-w-[770px] w-full mx-auto">
		<h1 class="mb-10 text-4xl font-bold text-black">Near Casino</h1>

		<p class="mb-8 text-lg text-brand-700">
			Welcome to Near Casino! This is as fake casino as possible. No worries, it's all virtual and
			no real money is involved.
		</p>

		<p class="mb-8 text-lg text-brand-700">
			Near Casino was created as a project to showcase how well <a
				class="font-bold underline"
				href="https://appwrite.io/">Appwrite</a
			>
			works with <a class="font-bold underline" href="https://kit.svelte.dev/">Svelte Kit</a> and it's
			server-side rendering.
		</p>

		<p class="mb-8 text-lg text-brand-700 font-bold">
			Keep in mind, SSR uses cookies! Your backend (Appwrite) and frontend (Svelte app) must be on
			the same domain to work properly. That could be either domain of your app, or localhost.
		</p>

		<h2 class="text-2xl font-bold text-brand-900 mb-8 mt-8">Let's Create Account!</h2>

		<p class="mb-8 text-lg text-brand-700">
			Why would we make it complex? Let's make anonymous session. It's just like a casual account,
			but it is lost as soon as your browser throws it out.
		</p>

		<p class="mb-8 text-lg text-brand-700">
			All it takes to create anonymous session is one <b class="font-bold">*click*</b> below.
		</p>

		<button
			on:click={onRegister}
			class="flex items-center justify-center space-x-3 bg-brand-600 hover:bg-brand-500 text-white rounded-none px-10 py-3"
		>
			{#if registering}
				<Loading />
			{/if}
			<span>Create Anonymous Account</span>
		</button>
	</div>
</div>
