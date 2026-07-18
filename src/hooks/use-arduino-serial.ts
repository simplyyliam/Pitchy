import { useCallback, useEffect, useRef, useState } from "react";

const ARDUINO_BAUD_RATE = 9600;

function getArduinoConnectionErrorMessage(error: unknown) {
  if (!(error instanceof DOMException) && !(error instanceof Error)) {
    return "Could not connect to the Arduino.";
  }

  if (error.name === "NotFoundError") {
    return "No Arduino was selected. Click Connect Arduino again and choose the Arduino port.";
  }

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "The browser blocked serial access. Use Chrome or Edge on localhost/HTTPS and allow the Arduino port.";
  }

  if (error.name === "NetworkError") {
    return "The Arduino port is busy or already open. Close Arduino IDE Serial Monitor, other tabs, or other apps using the port, then try again.";
  }

  if (error.message.toLowerCase().includes("already open")) {
    return "The Arduino port is already open. Disconnect it in any other page/app, then try again.";
  }

  if (error.message.toLowerCase().includes("not writable")) {
    return "The selected serial port is not writable. Pick the Arduino USB serial port, not a read-only device.";
  }

  return `Could not connect to the Arduino: ${error.message}`;
}

export function useArduinoSerial() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portRef = useRef<SerialPort | null>(null);
  const writerRef =
    useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const writeQueueRef = useRef(Promise.resolve());

  const sendToArduino = useCallback((value: string) => {
    const text = value.trim();

    if (!text) {
      return;
    }

    writeQueueRef.current = writeQueueRef.current
      .then(async () => {
        const writer = writerRef.current;

        if (!writer) {
          return;
        }

        const encoder = new TextEncoder();
        // The newline tells Arduino that the message is complete.
        await writer.write(encoder.encode(`${text}\n`));
      })
      .catch((error) => {
        console.error("Failed to send message:", error);
        setError("Could not send text to the Arduino.");
      });
  }, []);

  const connectArduino = useCallback(async () => {
    if (!("serial" in navigator)) {
      setError("Web Serial is not supported. Open the app in Chrome or Edge.");
      return;
    }

    try {
      setError(null);

      const port = await navigator.serial.requestPort();

      await port.open({
        baudRate: ARDUINO_BAUD_RATE,
      });

      if (!port.writable) {
        throw new Error("The serial port is not writable.");
      }

      portRef.current = port;
      writerRef.current = port.writable.getWriter();

      setConnected(true);
    } catch (error) {
      console.error("Arduino connection failed:", error);
      setConnected(false);
      setError(getArduinoConnectionErrorMessage(error));
    }
  }, []);

  const disconnectArduino = useCallback(async () => {
    try {
      writerRef.current?.releaseLock();
      writerRef.current = null;

      await portRef.current?.close();
      portRef.current = null;

      setConnected(false);
    } catch (error) {
      console.error("Disconnect failed:", error);
      setError("Could not disconnect from the Arduino.");
    }
  }, []);

  useEffect(() => {
    return () => {
      void disconnectArduino();
    };
  }, [disconnectArduino]);

  return {
    connected,
    connectArduino,
    disconnectArduino,
    error,
    sendToArduino,
  };
}
