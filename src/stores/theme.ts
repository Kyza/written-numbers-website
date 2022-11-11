import { createEffect } from "solid-js";
import { isServer } from "solid-js/web";
import { createCrossSignal } from "~/utilities/reactive";

const currentTheme = !isServer ? localStorage.getItem("theme") : "auto";

const theme = createCrossSignal(currentTheme ?? "auto");

createEffect(() => {
	localStorage.setItem("theme", theme());
});

export default theme;
