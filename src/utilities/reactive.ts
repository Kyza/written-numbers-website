import {
	Accessor,
	createEffect,
	createResource,
	createRoot,
	createSignal,
	onCleanup,
	ResourceActions,
	Setter,
} from "solid-js";

export type CrossSignal<A> = Accessor<A> & Setter<A>;
export type CrossResource<A> = CrossSignal<A> & ResourceActions<A>;

export function crossFunctions<A>(get: Accessor<A>, set: Setter<A>) {
	return function () {
		// Check if the key exists rather than the length of the array.
		if ("0" in arguments) return set(arguments[0]);
		return get();
	};
}

export function createCrossSignal<A>(
	...args: Parameters<typeof createSignal<A>>
): CrossSignal<A> {
	const [get, set] = createSignal(...args);
	return crossFunctions(get, set);
}

export function createCancellableEffect(fn: (dispose: Function) => any) {
	let _dispose: any;
	onCleanup(() => _dispose && _dispose()); // handle cleanup trigerred by owner
	createRoot((dispose) => {
		_dispose = dispose;
		createEffect(() => {
			fn(dispose);
		});
	});
}

// export function createResourceEffect<A>(
// 	func: () => Promise<A> | A
// ): ResourceEffect<A> {
// 	const [data, actions] = createResource(func);

// 	createEffect(async () => {
// 		if (data.loading) {
// 			// data()
// 		}
// 		func();

// 		// actions.mutate(await func());
// 		// untrack(() => {
// 		// actions.refetch();
// 		// });
// 	});

// }

export function crossResource<A>([data, actions]: ReturnType<
	typeof createResource<A>
>): CrossResource<A> {
	return Object.assign(crossFunctions(data, actions.mutate), actions);
}
