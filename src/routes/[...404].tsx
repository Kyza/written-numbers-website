import { Component } from "solid-js";
import { A, useParams } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default (function NotFound() {
	const params = useParams();

	return (
		<main>
			<HttpStatusCode code={404} />
			<h1>Page Not Found</h1>
			<p>
				<code>{params[404]}</code> does not exist. Go <A href="/">home</A>
				.
			</p>
		</main>
	);
} as Component);
