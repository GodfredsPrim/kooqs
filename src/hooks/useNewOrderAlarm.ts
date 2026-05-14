import { useEffect, useRef, useState, useCallback } from "react";
import type { Order } from "@/types";

export function useNewOrderAlarm(orders: Order[]) {
  const [alarming, setAlarming] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const lastSeenIdRef = useRef<string | null>(null);
  const seedDoneRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSiren = useCallback(() => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
  }, []);

  const playTone = useCallback((ctx: AudioContext, freq: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  }, []);

  const startSiren = useCallback(() => {
    if (typeof window === "undefined") return;
    stopSiren();
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;
    let high = true;
    playTone(ctx, 880, 380);
    sirenIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current) return;
      playTone(audioCtxRef.current, high ? 660 : 900, 380);
      high = !high;
    }, 420);
  }, [stopSiren, playTone]);

  // Detect new orders
  useEffect(() => {
    if (orders.length === 0) return;
    if (!seedDoneRef.current) {
      lastSeenIdRef.current = orders[0].id;
      seedDoneRef.current = true;
      return;
    }
    if (orders[0].id !== lastSeenIdRef.current) {
      setAlarming(true);
    }
  }, [orders]);

  // Start / stop siren when alarm or unlock state changes
  useEffect(() => {
    if (alarming && unlocked) {
      startSiren();
    } else if (!alarming) {
      stopSiren();
    }
    return () => { /* cleanup handled by stopSiren calls */ };
  }, [alarming, unlocked, startSiren, stopSiren]);

  // Cleanup on unmount
  useEffect(() => () => stopSiren(), [stopSiren]);

  function unlock() {
    if (typeof window === "undefined") return;
    // Play a silent tone to satisfy the browser autoplay policy
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
    setTimeout(() => ctx.close(), 200);
    setUnlocked(true);
  }

  function acknowledge() {
    stopSiren();
    setAlarming(false);
    if (orders.length > 0) lastSeenIdRef.current = orders[0].id;
  }

  return {
    alarming,
    acknowledge,
    unlock,
    unlocked,
    newestOrder: alarming && orders.length > 0 ? orders[0] : null,
  };
}
