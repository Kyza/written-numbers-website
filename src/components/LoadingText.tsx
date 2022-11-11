import { Component, createEffect, createMemo, onCleanup } from "solid-js";
import { createCrossSignal } from "~/utilities/reactive";

export const LoadingDots: Component<{
	speed?: number;
	max?: number;
}> = (props) => {
	const dotCount = createCrossSignal(1);

	createEffect(() => {
		const dotInterval = setInterval(() => {
			dotCount((dotCount() + 1) % (props.max ?? 3));
		}, props.speed ?? 1e2);

		onCleanup(() => {
			clearInterval(dotInterval);
		});
	});

	const dots = createMemo(() => ".".repeat(dotCount() + 1));

	return <>{dots()}</>;
};

const LoadingText: Component<{
	text?: string;
	speed?: number;
	max?: number;
}> = (props) => {
	return (
		<>
			{props.text ?? "Loading"}
			{<LoadingDots {...props} />}
		</>
	);
};

export default LoadingText;
