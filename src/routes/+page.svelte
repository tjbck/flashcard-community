<script lang="ts">
	import { generateOpenAIChatCompletion, splitStream } from '$lib/utils';

	export let data;

	let search = '';

	let responseContent = ``;

	const submitHandler = async () => {
		responseContent = '';

		const res = await generateOpenAIChatCompletion(data.token, {
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: `Given a term, provide a concise and accurate definition suitable for a flashcard. Do not include any additional information, examples, or context. Your response should strictly be the definition of the term.

Term: "${search}"
Definition:`
				}
			],
			stream: true
		});

		if (res && res.ok) {
			const reader = res.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(splitStream('\n'))
				.getReader();

			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					break;
				}

				try {
					let lines = value.split('\n');

					for (const line of lines) {
						if (line !== '') {
							console.log(line);
							if (line === 'data: [DONE]') {
							} else {
								let data = JSON.parse(line.replace(/^data: /, ''));
								console.log(data);

								if (responseContent == '' && data.choices[0].delta.content == '\n') {
									continue;
								} else {
									responseContent += data.choices[0].delta.content ?? '';
								}
							}
						}
					}
				} catch (error) {
					console.log(error);
				}
			}
		}

		console.log(res);
	};
</script>

<div class=" min-h-screen w-full flex justify-center">
	<div class="my-auto w-full max-w-2xl pb-28">
		<div class="w-full font-medium text-lg mb-2">Flashcard Builder</div>

		<div class="w-full flex bg-gray-850 border border-gray-800 px-3 py-2 rounded-full items-center">
			<div class="flex-1">
				<input
					bind:value={search}
					placeholder="Enter term"
					class=" px-3 py-2 w-full bg-transparent outline-none"
				/>
			</div>

			<div>
				<button
					class="bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-800 rounded-full transition p-2.5"
					disabled={search === ''}
					on:click={() => {
						submitHandler();
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="size-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
						/>
					</svg>
				</button>
			</div>
		</div>

		{#if responseContent}
			<div class="p-3">
				{responseContent}
			</div>
		{/if}
	</div>
</div>
