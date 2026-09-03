"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { expenseSchema } from "@/schemas/expense-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export function ExpenseForm() {
	// 1. Define your form.
	const form = useForm<z.infer<typeof expenseSchema>>({
		resolver: zodResolver(expenseSchema),
		defaultValues: {
			amount: 0,
			category: "",
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof expenseSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		fetch("/api", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...values,
				currency: "USD",
			}),
		});
	}

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Add Expense</CardTitle>
				<CardDescription>Add a new expense</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input placeholder="Amount" {...field} />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<FormControl>
										<Input placeholder="Category" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
