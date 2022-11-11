import { Component, onCleanup } from "solid-js";
import { createCrossSignal } from "~/utilities/reactive";

const startYear = 2022;

const CopyrightText: Component = () => {
	const year = createCrossSignal(new Date().getFullYear());
	const yearText = () =>
		year() > startYear ? `${startYear} - ${year()}` : year();

	const checkInterval = setInterval(
		() => year(new Date().getFullYear()),
		1e2
	);
	onCleanup(() => clearInterval(checkInterval));

	return <>© {yearText()} Kyza</>;
};

export default CopyrightText;
