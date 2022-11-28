import { Component, ComponentProps, onMount, Show } from "solid-js";
import { createCrossSignal } from "~/utilities/reactive";

export default (function ClientOnly(props) {
	const flag = createCrossSignal(false);

	onMount(() => {
		flag(true);
	});

	return <Show when={flag()}>{props.children}</Show>;
} as Component<{ children: ComponentProps<"div">["children"] }>);
