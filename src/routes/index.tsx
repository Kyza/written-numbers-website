import { Component, createEffect, createResource, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { RouteDataArgs, useNavigate, useRouteData } from "solid-start";
import LoadingText from "~/components/LoadingText";
import {
	createCancellableEffect,
	createCrossSignal,
} from "~/utilities/reactive";

import WordWorker from "~/workers/WordWorker.ts?worker";

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
	const characters = "0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return trimStart(result, "0").padEnd(1, "0");
}

export function routeData(props: RouteDataArgs) {
	return props.location.query.number ?? randomNumber(100);
}

function isSafeExpression(expression: string): boolean {
	if (isNaN(Number(expression))) return false;
	return true;
}

const cache = new Map<string, string>();
let lastWorker: Worker;

export default (function Home() {
	const expr = useRouteData<typeof routeData>();
	const navigate = useNavigate();

	const numberExpression = createCrossSignal(expr);

	const userIsSafe = createCrossSignal(isSafeExpression(numberExpression()));
	const userConfirmedRun = createCrossSignal(false);

	const minRandom = createCrossSignal(1);
	const maxRandom = createCrossSignal(1000);
	const ordinal = createCrossSignal(false);
	const and = createCrossSignal(false);
	const commas = createCrossSignal(false);

	const [numberWords, { refetch: recalculateWords }] =
		createResource<string>(async () => {
			if (isServer) return "Loading...";
			const data: MessageData = {
				expression: numberExpression(),
				and: and(),
				commas: commas(),
				ordinal: ordinal(),
			};
			const stringData = JSON.stringify(data);
			if (cache.has(stringData)) {
				return cache.get(stringData);
			}
			return new Promise((resolve) => {
				if (lastWorker) lastWorker.terminate();
				const worker = new WordWorker();
				lastWorker = worker;

				worker.onmessage = (message) => {
					cache.set(numberExpression(), message.data);
					resolve(message.data);
				};

				worker.onerror = (error) => {
					cache.set(numberExpression(), error.message);
					resolve(error.message);
				};

				worker.postMessage(data);
			});
		});

	createCancellableEffect((cancel) => {
		if (userConfirmedRun()) cancel();
		userIsSafe(isSafeExpression(numberExpression()));
	});

	createEffect(() => {
		navigate(`/?number=${encodeURIComponent(numberExpression())}`, {
			replace: true,
		});
		if (userIsSafe() || userConfirmedRun()) {
			recalculateWords();
		}
	});

	return (
		<main class={rootStyles.content}>
			<div class={styles.controlsWrapper}>
				<div class={styles.controlGroup}>
					<input
						type="text"
						class={styles.expressionBox}
						value={numberExpression()}
						oninput={(e) => {
							numberExpression(e.currentTarget.value);
						}}
					/>
				</div>
				<div class={styles.controlWrapGroup}>
					<div class={styles.controlGroup}>
						<input
							type="button"
							onclick={() => {
								numberExpression(
									randomNumber(randomRange(minRandom(), maxRandom()))
								);
							}}
							value="Random Number (by digit length)"
						/>
					</div>
					<div class={styles.controlGroup}>
						<span>Min Digits: </span>
						<input
							name="Minimum"
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
						<span>Max Digits: </span>
						<input
							name="Maximum"
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
								numberExpression("0");
								navigate(`/`, {
									replace: true,
								});
							}}
							value="Clear"
						/>
					</div>
					<div class={styles.controlGroup}>
						<ThemeButton />
					</div>
				</div>
			</div>
			<article class={styles.words}>
				<Show when={!userIsSafe() && !userConfirmedRun()}>
					<p>The expression is not a basic number.</p>
					<p>
						The expression is evaluated with JavaScript and could be
						potentially dangerous if someone sent it to you.
					</p>
					<p>Are you sure you want to run it?</p>
					<button
						onclick={() => {
							userConfirmedRun(true);
						}}
					>
						Run The Code
					</button>
				</Show>
				<Show when={userIsSafe() || userConfirmedRun()}>
					<p>
						<Show
							when={!numberWords.loading}
							fallback={<LoadingText text="Calculating" />}
						>
							{numberWords()}
						</Show>
					</p>
				</Show>
			</article>
			<p>
				<CopyrightText />
			</p>
		</main>
	);
} as Component);
