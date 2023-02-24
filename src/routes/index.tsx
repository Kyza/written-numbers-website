import { batch, Component, createEffect, Show, untrack } from "solid-js";
import { isServer } from "solid-js/web";
import { RouteDataArgs, useNavigate, useRouteData } from "solid-start";
import LoadingText from "~/components/LoadingText";
import {
	connectLocalStorage,
	createCancellableEffect,
	createCrossSignal,
} from "~/utilities/reactive";

import WordWorker from "~/workers/WordWorker.ts?worker";

import { createStore } from "solid-js/store";
import ClientOnly from "~/components/ClientOnly";
import CopyrightText from "~/components/CopyrightText";
import ThemeButton from "~/components/ThemeButton";
import rootStyles from "~/root.module.css";
import { MessageData } from "~/workers/WordWorker";
import styles from "./index.module.css";

function trimStart(str: string, character: string): string {
	let i = 0;
	for (; i < str.length; i++) {
		if (str[i] !== character) break;
	}
	return str.slice(i);
}

function randomRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function randomNumber(length: number): string {
	let result = "";
	let characters = "123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
		if (i === 0) characters += "0";
	}
	return trimStart(result, "0").padEnd(1, "0");
}

function fixedEncodeURIComponent(str: string): string {
	return encodeURIComponent(str).replace(
		/[!'()*]/g,
		(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
	);
}

export function routeData(props: RouteDataArgs) {
	return props.location.query.number;
}

function isSafeExpression(expression: string): true | "script" | "length" {
	if (expression.length > 1000) return "length";
	if (!/^(-?\d+)(\.\d+)?$/.test(expression)) return "script";
	return true;
}

const cache = new Map<string, string>();
let worker: Worker = null;

export default (function Home() {
	const routeExpression = useRouteData<typeof routeData>();
	const navigate = useNavigate();

	const expression = createCrossSignal(routeExpression);

	connectLocalStorage(
		"expression",
		() => expression().toString(),
		(value) => expression(value),
		untrack(() => expression() ?? randomNumber(100)),
		// Only override if there was no query string.
		expression() != null ? true : false
	);

	const expressionSafety = createCrossSignal(isSafeExpression(expression()));
	const [userConfirmedRuns, setUserConfirmedRuns] = createStore({
		script: false,
		length: false,
	});

	const copying = createCrossSignal(false);

	const minRandom = createCrossSignal(1);
	const maxRandom = createCrossSignal(1000);
	const ordinal = createCrossSignal(false);
	const and = createCrossSignal(false);
	const commas = createCrossSignal(false);

	connectLocalStorage(
		"minRandom",
		() => minRandom().toString(),
		(value) => minRandom(parseInt(value)),
		untrack(() => minRandom().toString())
	);
	connectLocalStorage(
		"maxRandom",
		() => maxRandom().toString(),
		(value) => maxRandom(parseInt(value)),
		untrack(() => maxRandom().toString())
	);
	connectLocalStorage(
		"ordinal",
		() => ordinal().toString(),
		(value) => ordinal(value === "true" ? true : false),
		untrack(() => ordinal().toString())
	);
	connectLocalStorage(
		"and",
		() => and().toString(),
		(value) => and(value === "true" ? true : false),
		untrack(() => and().toString())
	);
	connectLocalStorage(
		"commas",
		() => commas().toString(),
		(value) => commas(value === "true" ? true : false),
		untrack(() => commas().toString())
	);

	const [numberWords, setNumberWords] = createStore({
		words: null,
		loading: true,
	});
	async function recalculateWords() {
		if (isServer) return "Loading...";

		console.groupEnd();
		console.group("Calculation:");

		if (untrack(() => numberWords.loading)) {
			if (worker) {
				worker.terminate();
				console.log("Killed previous WASM Worker.");
			}

			worker = new WordWorker();
		}
		setNumberWords("loading", true);

		const data: MessageData = {
			expression: expression(),
			options: { language: "en" },
			languageOptions: {
				hundred_and: and(),
				commas: commas(),
				ordinal: ordinal(),
			},
		};
		const stringData = JSON.stringify(data);

		if (cache.has(stringData)) {
			console.log("Used cached value.");

			setNumberWords("words", cache.get(stringData));
			setNumberWords("loading", false);
			return;
		}

		worker.onmessage = (message) => {
			cache.set(stringData, message.data);
			console.log("Received words.");
			console.groupEnd();

			batch(() => {
				setNumberWords("loading", false);
				setNumberWords("words", message.data);
			});
		};

		worker.onerror = (error) => {
			cache.set(stringData, error.message);
			console.log("Received error.");
			console.error(error);
			console.groupEnd();

			setNumberWords("words", error.message);
		};

		worker.postMessage(data);
	}

	createCancellableEffect((cancel) => {
		if (userConfirmedRuns.script) cancel();
		expressionSafety(isSafeExpression(expression()));
	});
	createCancellableEffect((cancel) => {
		if (userConfirmedRuns.length) cancel();
		expressionSafety(isSafeExpression(expression()));
	});

	createEffect(() => {
		navigate(`/?number=${fixedEncodeURIComponent(expression())}`, {
			replace: true,
		});
		if (
			// Explicitly check true since strings are truthy.
			expressionSafety() === true ||
			(typeof expressionSafety() === "string" &&
				userConfirmedRuns[expressionSafety() as string])
		) {
			recalculateWords();
		}
	});

	return (
		<main class={rootStyles.content}>
			<div class={styles.controlsWrapper}>
				<div class={styles.controlColumn}>
					<input
						type="text"
						class={styles.expressionBox}
						value={expression()}
						oninput={(e) => {
							expression(e.currentTarget.value);
						}}
					/>
				</div>
				<div class={styles.controlColumn}>
					<div class={styles.controlGroup}>
						<input
							type="button"
							onclick={() => {
								expression(
									randomNumber(randomRange(minRandom(), maxRandom()))
								);
							}}
							value="Random Number (by digit length)"
						/>
					</div>
					<div class={styles.controlGroup}>
						<label for="minimum">Min Digits: </label>
						<input
							id="minimum"
							type="number"
							oninput={(e) => {
								minRandom(e.currentTarget.valueAsNumber);
							}}
							min={1}
							max={maxRandom()}
							value={minRandom()}
						/>
					</div>
					<div class={styles.controlGroup}>
						<label for="maximum">Max Digits: </label>
						<input
							id="maximum"
							type="number"
							oninput={(e) => {
								maxRandom(e.currentTarget.valueAsNumber);
							}}
							min={minRandom()}
							value={maxRandom()}
						/>
					</div>
					<div class={styles.controlGroup}>
						<button
							onclick={() => {
								ordinal(!ordinal());
								recalculateWords();
							}}
						>
							<input type="checkbox" checked={ordinal()} />
							<span>Ordinal</span>
						</button>
					</div>
					<div class={styles.controlGroup}>
						<button
							onclick={() => {
								and(!and());
								recalculateWords();
							}}
						>
							<input type="checkbox" checked={and()} />
							<span>Hundred And</span>
						</button>
					</div>
					<div class={styles.controlGroup}>
						<button
							onclick={() => {
								commas(!commas());
								recalculateWords();
							}}
						>
							<input type="checkbox" checked={commas()} />
							<span>Commas</span>
						</button>
					</div>
					<div class={styles.controlGroup}>
						<input
							type="button"
							onclick={() => {
								expression("0");
								navigate(`/`, {
									replace: true,
								});
							}}
							value="Clear"
						/>
					</div>
					<div class={styles.controlGroup}>
						<button
							onclick={async () => {
								copying(true);
								await navigator.clipboard.writeText(
									numberWords.words
								);
								copying(false);
							}}
							disabled={copying()}
						>
							<Show when={copying()}>
								<LoadingText text="Copying" />
							</Show>
							<Show when={!copying()}>Copy Result</Show>
						</button>
					</div>
					<div class={styles.controlGroup}>
						<ThemeButton />
					</div>
				</div>
			</div>
			<article class={styles.words}>
				<Show
					when={
						expressionSafety() === "length" && !userConfirmedRuns.length
					}
				>
					<p>
						This is very long number of the length{" "}
						{expression().length.toLocaleString()}.
					</p>
					<p>
						It could potentially take a very long time, use high CPU,
						and freeze the tab.
					</p>
					<p>Are you sure you want to run it?</p>
					<button
						class={styles.button}
						onclick={() => {
							setUserConfirmedRuns("length", true);
						}}
					>
						Run The Number
					</button>
					<button
						class={styles.button}
						onclick={() => {
							expression("0");
						}}
					>
						Clear
					</button>
				</Show>
				<Show
					when={
						expressionSafety() === "script" && !userConfirmedRuns.script
					}
				>
					<p>The expression is not a basic number.</p>
					<p>
						It's evaluated with JavaScript and could be potentially
						<strong>
							<i> dangerous</i>
						</strong>{" "}
						if someone sent it to you.
					</p>
					<p>
						It could potentially take a very long time, use high CPU,
						and freeze the tab.
					</p>
					<p>Are you sure you want to run it?</p>
					<button
						class={styles.button}
						onclick={() => {
							setUserConfirmedRuns("script", true);
						}}
					>
						Run The Code
					</button>
					<button
						class={styles.button}
						onclick={() => {
							expression("0");
						}}
					>
						Clear
					</button>
				</Show>
				<ClientOnly>
					<Show
						when={
							expressionSafety() === true ||
							(typeof expressionSafety() === "string" &&
								userConfirmedRuns[expressionSafety() as string])
						}
					>
						<p>
							<Show
								when={!numberWords.loading}
								fallback={<LoadingText text="Calculating" />}
							>
								{numberWords.words}
							</Show>
						</p>
					</Show>
				</ClientOnly>
			</article>
			<p>
				<CopyrightText />
			</p>
		</main>
	);
} as Component);
