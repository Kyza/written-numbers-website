export default function classList(...classes: string[]): string {
	return classes
		.flat(Infinity)
		.filter(Boolean)
		.join(" ")
		.trim()
		.replace(/\s+/, " ");
}

export function ct(classString: string, enabled: boolean): string | false {
	return enabled ? classString : false;
}
