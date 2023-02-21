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

			// Return fetched data
			return {
				props: {
					account,
					profile
				}
			};
		} catch (err: any) {
			console.error(err);

			if (browser) {
				// Fail on client is critical. Redirect to homepage
				return {
					status: 302,
					redirect: '/'
				};
			} else {
				// SSR failed. It will be tried again on client side; no need to redirect
				return {};
			}
		}
	}
</script>

<script lang="ts">
	import type { Models, RealtimeResponseEvent } from 'appwrite';

	// Data from module
	export let account: Models.User<any> | undefined;
	export let profile: Profile | undefined;

	// Realtime logic
	$: {
		if (profile && browser) {
			AppwriteService.subscribeProfile(profile.$id, onProfileChange);
		}
	}

	function onProfileChange(response: RealtimeResponseEvent<Profile>) {
		profile = response.payload;
	}

	// Logout logic
	let signingOut = false;
	async function onSignOut() {
		if (signingOut) {
			return;
		}

		signingOut = true;

		try {
			await AppwriteService.signOut();
			await goto('/');
		} catch (err: any) {
			Alert.warning(err.message ? err.message : err);
		} finally {
			signingOut = true;
		}
	}

	// Betting logic
	let bet: number;

	function onUpdateBet(price: number) {
		return () => {
			bet = bet === undefined ? price : bet + price;

			bet = Math.min(profile?.balance || 0, bet);
			bet = Math.max(1, bet);
		};
	}

	let betting = false;

	function onBet(side: 'heads' | 'tails') {
		return async () => {
			if (!profile || !account || betting) {
				return;
			}

			betting = true;

			try {
				const didWin = await AppwriteService.bet(bet, side);

				if (didWin) {
					Alert.success(`You won ${bet} Near Dollars.`);
				} else {
					Alert.error(`You lost ${bet} Near Dollars.`);
				}
			} catch (err: any) {
				Alert.warning(err.message ? err.message : err);
			} finally {
				betting = false;
			}
		};
	}
</script>

<div class="w-full min-h-[100vh] py-10 px-2 bg-brand-50">
	<div class="max-w-[770px] w-full mx-auto">
		<h1 class="mb-10 text-4xl font-bold text-black">Near Casino</h1>

		<p class="mb-8 text-lg text-brand-700">
			There we go, account created! Don't believe? This is your ID: <b class="font-bold"
				>{account?.$id}</b
			>
		</p>

		<p class="mb-8 text-lg text-brand-700 opacity-50">
			If the account ID is not server-side rendered, it means we dont have same-domain
			authentication cookie. Please make sure to run frontend app on same domain as Appwrite
			backend.
		</p>

		<button
			on:click={onSignOut}
			class="flex items-center justify-center space-x-3 border-brand-600 border-2 hover:border-brand-500 hover:text-brand-500 text-brand-600 rounded-none px-10 py-3"
		>
			{#if signingOut}
				<Loading />
			{/if}
			<span>Sign Out</span>
		</button>

		<h2 class="text-2xl font-bold text-brand-900 mb-8 mt-8">Balance</h2>

		<p class="mb-3 text-lg text-brand-700">Your current blalance is:</p>
		<p class="mb-8 text-3xl font-bold text-brand-900">
			{profile?.balance} <span class="text-brand-900 opacity-25">Near Dollars</span>
		</p>

		<h2 class="text-2xl font-bold text-brand-900 mb-8 mt-8">Coin Flip</h2>

		<p class="mb-8 text-lg text-brand-700">
			Head or tails? Place your bet and see if luck is on your side.
		</p>

		<div class="flex items-center mb-3 flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-3">
			<button
				on:click={onUpdateBet(-10)}
				class="border-brand-600 border-2 hover:border-brand-500 hover:text-brand-500 text-brand-600 rounded-none px-8 py-4"
			>
				<span>-10</span>
			</button>
			<input
				bind:value={bet}
				class=" bg-brand-50 p-4 border-2 border-brand-600 placeholder-brand-600 placeholder-opacity-50 text-brand-600"
				type="number"
				placeholder="Enter amount to bet"
			/>
			<button
				on:click={onUpdateBet(10)}
				class="border-brand-600 border-2 hover:border-brand-500 hover:text-brand-500 text-brand-600 rounded-none px-8 py-4"
			>
				<span>+10</span>
			</button>
		</div>

		<div class="flex items-center space-x-3">
			<button
				on:click={onBet('heads')}
				class="flex items-center justify-center space-x-3 border-2 border-brand-600 hover:border-brand-500 bg-brand-600 hover:bg-brand-500 text-white rounded-none px-10 py-3"
			>
				{#if betting}
					<Loading />
				{/if}
				<span>Heads!</span>
			</button>

			<button
				on:click={onBet('tails')}
				class="flex items-center justify-center space-x-3 border-2 border-brand-600 hover:border-brand-500 bg-brand-600 hover:bg-brand-500 text-white rounded-none px-10 py-3"
			>
				{#if betting}
					<Loading />
				{/if}
				<span>Tails!</span>
			</button>
		</div>
	</div>
</div>
