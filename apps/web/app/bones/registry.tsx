"use client";

import { configureBoneyard } from "boneyard-js/react";
import "./generated/registry";

configureBoneyard({
	animate: "pulse",
	transition: true,
	stagger: true,
});

export function BoneyardRegistry() {
	return null;
}
