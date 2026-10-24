import { useCallback, useRef, useState } from "react";
import { emptySteps, MAX_STEPS, MIN_STEPS, type Draft } from "../lib/funnelDraft";

export function useFunnelEditor() {
  const [steps, setSteps] = useState<Draft[]>(emptySteps);
  const [name, setName] = useState("");
  const loaded = useRef(false);

  const load = useCallback((initial: { name?: string; steps: Draft[] }) => {
    if (loaded.current) return;
    loaded.current = true;
    setName(initial.name ?? "");
    setSteps(initial.steps.length >= MIN_STEPS ? initial.steps.map((s) => ({ ...s })) : emptySteps());
  }, []);

  const setStep = useCallback((index: number, step: Draft) => {
    setSteps((current) => current.map((s, i) => (i === index ? step : s)));
  }, []);

  const addStep = useCallback(() => {
    setSteps((current) => (current.length >= MAX_STEPS ? current : [...current, { type: "page", value: "" }]));
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((current) => (current.length <= MIN_STEPS ? current : current.filter((_, i) => i !== index)));
  }, []);

  const moveStep = useCallback((index: number, offset: -1 | 1) => {
    setSteps((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return { steps, name, setName, setStep, addStep, removeStep, moveStep, load };
}
