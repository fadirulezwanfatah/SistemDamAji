import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum UserRole {
    MAIN_ADMIN = 'main_admin',
    URUSETIA = 'urusetia',
    PERSONAL = 'personal'
}

export interface UserPermissions {
    canLockSystem: boolean;
    canUnlockSystem: boolean;
    canResetTournament: boolean;
    canModifySettings: boolean;
    canManagePlayers: boolean;
    canManageMatches: boolean;
    canViewReports: boolean;
    canExportData: boolean;
}

interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    role: UserRole | null;
    permissions: UserPermissions;
    login: (username: string, role: UserRole) => void;
    logout: () => void;
    hasPermission: (permission: keyof UserPermissions) => boolean;
}

const getPermissionsByRole = (role: UserRole): UserPermissions => {
    switch (role) {
        case UserRole.MAIN_ADMIN:
            return {
                canLockSystem: true,
                canUnlockSystem: true,
                canResetTournament: true,
                canModifySettings: true,
                canManagePlayers: true,
                canManageMatches: true,
                canViewReports: true,
                canExportData: true,
            };
        case UserRole.URUSETIA:
            return {
                canLockSystem: true,
                canUnlockSystem: false, // TIDAK boleh buka kunci sistem
                canResetTournament: false, // TIDAK boleh reset tournament
                canModifySettings: false, // TIDAK boleh modify settings
                canManagePlayers: true,
                canManageMatches: true,
                canViewReports: true,
                canExportData: true,
            };
        case UserRole.PERSONAL:
            return {
                canLockSystem: false,
                canUnlockSystem: false,
                canResetTournament: false,
                canModifySettings: true,
                canManagePlayers: true,
                canManageMatches: true,
                canViewReports: true,
                canExportData: true,
            };
        default:
            return {
                canLockSystem: false,
                canUnlockSystem: false,
                canResetTournament: false,
                canModifySettings: false,
                canManagePlayers: false,
                canManageMatches: false,
                canViewReports: false,
                canExportData: false,
            };
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            username: null,
            role: null,
            permissions: getPermissionsByRole(UserRole.PERSONAL),
            login: (username: string, role: UserRole) => {
                const permissions = getPermissionsByRole(role);
                set({ isAuthenticated: true, username, role, permissions });
            },
            logout: () => {
                set({
                    isAuthenticated: false,
                    username: null,
                    role: null,
                    permissions: getPermissionsByRole(UserRole.PERSONAL)
                });
            },
            hasPermission: (permission: keyof UserPermissions) => {
                const state = get();
                return state.permissions[permission];
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
