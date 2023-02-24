import { Component, createMemo } from "solid-js";
import theme from "~/stores/theme";

const ThemeButton: Component = () => {
	const formattedTheme = createMemo(
		() => theme().charAt(0).toUpperCase() + theme().slice(1)
	);

	return (
		<input
			type="button"
			onclick={() => {
				switch (theme()) {
					case "auto":
						theme("dark");
						break;
					case "dark":
						theme("light");
						break;
					case "light":
					default:
						theme("auto");
						break;
				}
			}}
			value={`${formattedTheme()} Theme`}
		/>
	);
};

export default ThemeButton;
