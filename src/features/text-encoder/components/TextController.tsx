import { useEffect, useRef, useState } from "react";

export const TextController = () => {
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);

  const portRef = useRef<SerialPort | null>(null);
  const writerRef =
    useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  async function connectArduino() {
    if (!("serial" in navigator)) {
      alert("Web Serial is not supported. Open the app in Chrome or Edge.");
      return;
    }

    try {
      const port = await navigator.serial.requestPort();

      await port.open({
        baudRate: 9600,
      });

      if (!port.writable) {
        throw new Error("The serial port is not writable.");
      }

      portRef.current = port;
      writerRef.current = port.writable.getWriter();

      setConnected(true);
    } catch (error) {
      console.error("Arduino connection failed:", error);
    }
  }

  useEffect(() => {
    async function sendMessage() {
      const writer = writerRef.current;

      if (!writer || !message.trim()) {
        return;
      }

      try {
        const encoder = new TextEncoder();
        // The newline tells Arduino that the message is complete.
        await writer.write(encoder.encode(`${message}\n`));
      }
      catch (err) {
        console.error("Failed to send message:", err);
      }

    }
    void sendMessage()
  }, [message]);

  async function disconnectArduino() {
    try {
      writerRef.current?.releaseLock();
      writerRef.current = null;

      await portRef.current?.close();
      portRef.current = null;

      setConnected(false);
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 items-center justify-center w-full h-screen">
      <h1>Arduino OLED Controller</h1>

      {!connected ? (
        <button onClick={connectArduino}>
          Connect Arduino
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter OLED text"
              className="p-2.5 rounded-2xl bg-neutral-100 border border-neutral-300"
            />

            <div className="flex gap-2.5 items-center justify-centerjustify-center">
              {/*<button className="cursor-pointer flex items-center justify-center p-2.5 rounded-full bg-neutral-100 border border-neutral-300">
                Display text
              </button>*/}

              <button onClick={disconnectArduino} className="cursor-pointer flex items-center justify-center p-2.5 rounded-full bg-neutral-100 border border-neutral-300">
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
