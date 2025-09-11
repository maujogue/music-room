import { Badge, BadgeText } from "@/components/ui/badge";
import React, { useState } from "react";
import { View, Pressable } from "react-native";

interface Props {
	filters?: string[];
	defaultActive?: string;
	active?: string; // controlled prop
	onChange: (filter: string) => void;
}

export default function FilterChips({ filters, defaultActive, active, onChange }: Props) {
	const [activeFilter, setActiveFilter] = useState<string | null>(null); // no filter active by default

	React.useEffect(() => {
		if (active !== undefined && active !== null && active !== 'All') {
			setActiveFilter(active);
		} else {
			setActiveFilter(null); // 'All' means no specific filter is active
		}
	}, [active]);

	const handlePress = (filter: string) => {
		if (filter === activeFilter) {
			// if clicking on already active filter, deactivate it (go back to "All")
			setActiveFilter(null);
			onChange("All");
		} else {
			setActiveFilter(filter);
			onChange(filter);
		}
	};

	return (
		<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
			{filters.map((filter) => {
				const isActive = filter === activeFilter;
				return (
					<Pressable key={filter} onPress={() => handlePress(filter)}>
						<Badge
							size="md"
							variant={isActive ? "solid" : "outline"}
							action={isActive ? "primary" : "muted"}
							rounded="full"
						>
							<BadgeText>{filter}</BadgeText>
						</Badge>
					</Pressable>
				);
			})}
		</View>
	);
}
