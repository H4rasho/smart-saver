import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export interface SelectComboboxOption {
	label: string;
	value: string;
}

interface SelectComboboxProps {
	options: SelectComboboxOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	name?: string;
	required?: boolean;
}

export const SelectCombobox: React.FC<SelectComboboxProps> = ({
	options,
	value,
	onChange,
	placeholder = "Selecciona una opción",
	label,
	name,
	required = false,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="w-full">
			{label && (
				<label htmlFor={name} className="block mb-1 text-sm font-medium">
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						aria-expanded={open}
						className="w-full justify-between"
						disabled={options.length === 0}
					>
						{value
							? options.find((opt) => opt.value === value)?.label
							: options.length === 0
								? "No hay opciones disponibles"
								: placeholder}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0 z-[100]"
					align="start"
					side="bottom"
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<Command>
						<CommandInput placeholder="Buscar..." className="h-9" />
						<CommandList>
							<CommandEmpty>No se encontró opción.</CommandEmpty>
							<CommandGroup>
								{options.map((opt) => (
									<CommandItem
										key={opt.value}
										value={opt.label}
										onSelect={() => {
											onChange(opt.value);
											setOpen(false);
										}}
									>
										{opt.label}
										<Check
											className={cn(
												"ml-auto h-4 w-4",
												value === opt.value ? "opacity-100" : "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{name && (
				<input type="hidden" name={name} value={value} required={required} />
			)}
		</div>
	);
};
