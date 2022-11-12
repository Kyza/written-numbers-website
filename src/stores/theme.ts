import { untrack } from "solid-js";
import { connectLocalStorage, createCrossSignal } from "~/utilities/reactive";

const theme = createCrossSignal("auto");

connectLocalStorage(
	"theme",
	() => theme(),
	(value) => theme(value),
	untrack(() => theme().toString())
);

export default theme;
