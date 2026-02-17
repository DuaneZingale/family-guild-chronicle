import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface FamilyMembership {
  familyId: string;
  familyName: string;
  role: "parent" | "kid";
  characterId: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  membership: FamilyMembership | null;
  /** Kid PIN mode: no Supabase user, just a character ID */
  kidPinCharacterId: string | null;
  kidPinFamilyId: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  enterKidPinMode: (characterId: string, familyId: string) => void;
  exitKidPinMode: () => void;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    membership: null,
    kidPinCharacterId: null,
    kidPinFamilyId: null,
  });

  async function fetchMembership(userId: string) {
    const { data } = await supabase
      .from("memberships")
      .select("family_id, role, families(name)")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (!data) return null;

    // Get linked character
    const { data: link } = await supabase
      .from("user_character_links")
      .select("character_id")
      .eq("user_id", userId)
      .eq("family_id", data.family_id)
      .limit(1)
      .single();

    const familyRow = data.families as any;

    return {
      familyId: data.family_id,
      familyName: familyRow?.name ?? "",
      role: data.role as "parent" | "kid",
      characterId: link?.character_id ?? null,
    };
  }

  async function refreshMembership() {
    if (!state.user) return;
    const membership = await fetchMembership(state.user.id);
    setState((s) => ({ ...s, membership }));
  }

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let membership: FamilyMembership | null = null;

        if (user) {
          membership = await fetchMembership(user.id);
        }

        setState((s) => ({
          ...s,
          user,
          session,
          loading: false,
          membership,
        }));
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let membership: FamilyMembership | null = null;

      if (user) {
        membership = await fetchMembership(user.id);
      }

      setState((s) => ({
        ...s,
        user,
        session,
        loading: false,
        membership,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      loading: false,
      membership: null,
      kidPinCharacterId: null,
      kidPinFamilyId: null,
    });
  }

  function enterKidPinMode(characterId: string, familyId: string) {
    setState((s) => ({ ...s, kidPinCharacterId: characterId, kidPinFamilyId: familyId }));
  }

  function exitKidPinMode() {
    setState((s) => ({ ...s, kidPinCharacterId: null, kidPinFamilyId: null }));
  }

  return (
    <AuthContext.Provider
      value={{ ...state, signOut, enterKidPinMode, exitKidPinMode, refreshMembership }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
