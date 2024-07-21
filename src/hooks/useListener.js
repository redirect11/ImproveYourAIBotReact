import EventEmitter from "events";
import { useCallback, useEffect, useRef } from "react";

export default function useListener(listener = () => {}) {
  const emitter = useRef(new EventEmitter());

  useEffect(() => {
    const currentEmitter = emitter.current;
    currentEmitter.on("event", listener);
    return () => {
      currentEmitter.off("event", listener);
    };
  }, [listener]);

  const dispatch = useCallback((...payload) => {
    emitter.current.emit("event", ...payload);
  }, []);

  return [dispatch, emitter];
}
