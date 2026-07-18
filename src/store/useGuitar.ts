import { create } from "zustand"

type GuitarStore = {
  pitch: string
  setPitch: (value: string) => void
}


export const useGuitar = create<GuitarStore>((set) => ({
  pitch: "-",
  setPitch: (value) => set({pitch: value})
}))
