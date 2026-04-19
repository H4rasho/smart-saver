"use client";

import {
	formatCurrencyAmountInputValue,
	normalizeCurrencyAmountInput,
} from "@/app/core/user/lib/user-lib";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

function getCanonicalAmountValue(
	value: number | string | undefined,
	currency: string,
): string {
	if (typeof value === "number") {
		return Number.isFinite(value) ? String(value) : "";
	}

	if (typeof value === "string") {
		return normalizeCurrencyAmountInput(value, currency);
	}

	return "";
}

interface AmountInputProps
	extends Omit<
		React.ComponentProps<typeof Input>,
		"defaultValue" | "name" | "onChange" | "type" | "value"
	> {
	currency: string;
	defaultValue?: number | string;
	name?: string;
	onValueChange?: (value: string) => void;
	previewClassName?: string;
	showFormattedPreview?: boolean;
	value?: number | string;
}

export function AmountInput({
	currency,
	defaultValue,
	name,
	onBlur,
	onFocus,
	onValueChange,
	previewClassName,
	showFormattedPreview = true,
	value,
	...props
}: AmountInputProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const isControlled = value !== undefined;
	const externalCanonicalValue = getCanonicalAmountValue(value, currency);
	const initialCanonicalValue = getCanonicalAmountValue(defaultValue, currency);
	const [internalCanonicalValue, setInternalCanonicalValue] = useState<string>(
		isControlled ? externalCanonicalValue : initialCanonicalValue,
	);
	const [draftDisplayValue, setDraftDisplayValue] = useState<string | null>(
		null,
	);
	const canonicalValue = isControlled
		? externalCanonicalValue
		: internalCanonicalValue;
	const displayValue =
		draftDisplayValue ??
		(canonicalValue === ""
			? ""
			: formatCurrencyAmountInputValue(canonicalValue, currency));
	const formattedPreviewValue =
		canonicalValue === ""
			? ""
			: formatCurrencyAmountInputValue(canonicalValue, currency);
	const shouldShowPreview =
		showFormattedPreview && formattedPreviewValue !== "";

	useEffect(() => {
		const form = wrapperRef.current?.closest("form");

		if (!form) {
			return;
		}

		const handleReset = () => {
			const resetValue = getCanonicalAmountValue(defaultValue, currency);

			if (!isControlled) {
				setInternalCanonicalValue(resetValue);
			}

			setDraftDisplayValue(null);
			onValueChange?.(resetValue);
		};

		form.addEventListener("reset", handleReset);

		return () => {
			form.removeEventListener("reset", handleReset);
		};
	}, [currency, defaultValue, isControlled, onValueChange]);

	return (
		<div ref={wrapperRef} className="space-y-2">
			<Input
				{...props}
				type="text"
				inputMode="decimal"
				value={displayValue}
				onChange={(event) => {
					const nextDisplayValue = event.target.value;
					const nextCanonicalValue = normalizeCurrencyAmountInput(
						nextDisplayValue,
						currency,
					);

					setDraftDisplayValue(nextDisplayValue);

					if (!isControlled) {
						setInternalCanonicalValue(nextCanonicalValue);
					}

					onValueChange?.(nextCanonicalValue);
				}}
				onFocus={(event) => {
					setDraftDisplayValue(canonicalValue);
					onFocus?.(event);
				}}
				onBlur={(event) => {
					setDraftDisplayValue(null);
					onBlur?.(event);
				}}
			/>
			{shouldShowPreview ? (
				<p
					aria-live="polite"
					className={cn("text-xs text-muted-foreground", previewClassName)}
				>
					Vista previa:{" "}
					<span className="font-medium text-foreground">
						{formattedPreviewValue}
					</span>
				</p>
			) : null}
			{name ? <input type="hidden" name={name} value={canonicalValue} /> : null}
		</div>
	);
}
