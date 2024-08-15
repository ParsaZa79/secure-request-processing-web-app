/* eslint-disable prettier/prettier */
// app/components/UserDropdown.tsx
import { useRouter } from "next/navigation";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    User,
} from "@nextui-org/react";

import { useAuth } from "../hooks/useAuth";

export function UserDropdown() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <User
                    as="button"
                    avatarProps={{
                        isBordered: true,
                        src: "/3d-fluency-confused-face.png",
                    }}
                    className="transition-transform"
                    description={user?.email}
                    name={user?.name}
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-bold">Signed in as</p>
                    <p className="font-bold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    Log Out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
