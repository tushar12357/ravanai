import { UltravoxSession } from "ultravox-client";
import { create } from "zustand";

interface UltravoxStore {
  session: UltravoxSession | null;
  status: string;
  transcripts: string[] | null;
  isListening: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  setSession: (session: UltravoxSession) => void;
  setStatus: (status: string) => void;
  setTranscripts: (transcripts: string[] | null) => void;
  setIsListening: (isListening: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsDisconnecting: (isDisconnecting: boolean) => void;
}

export const useUltravoxStore = create<UltravoxStore>((set) => ({
  session: null,
  status: "disconnected",
  transcripts: null,
  isListening: false,
  isConnecting: false,
  isDisconnecting: false,
  setSession: (session: UltravoxSession) => set({ session }),
  setStatus: (status: string) => set({ status }),
  setTranscripts: (transcripts: string[] | null) => set({ transcripts }),
  setIsListening: (isListening: boolean) => set({ isListening }),
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setIsDisconnecting: (isDisconnecting: boolean) => set({ isDisconnecting }),
}));