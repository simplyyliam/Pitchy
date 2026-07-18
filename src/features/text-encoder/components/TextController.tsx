import { useArduinoSerial } from "@/hooks/use-arduino-serial";
import { useGuitar } from "@/store/useGuitar";
import { useEffect, useMemo, useState } from "react";

export const TextController = () => {
  const [message, setMessage] = useState("");
  const pitch = useGuitar((state) => state.pitch);
  const displayText = useMemo(() => message.trim() || pitch, [message, pitch]);
  const {
    connected,
    connectArduino,
    disconnectArduino,
    error,
    sendToArduino,
  } = useArduinoSerial();

  useEffect(() => {
    if (!connected || displayText === "-") {
      return;
    }

    sendToArduino(displayText);
  }, [connected, displayText, sendToArduino]);

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
            <p className="text-sm text-neutral-500">
              Current detected pitch: {pitch}
            </p>

            <p className="text-sm text-neutral-500">
              OLED display text: {displayText}
            </p>

            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter OLED text"
              className="p-2.5 rounded-2xl bg-neutral-100 border border-neutral-300"
            />

            <div className="flex gap-2.5 items-center justify-center">
              {/*<button className="cursor-pointer flex items-center justify-center p-2.5 rounded-full bg-neutral-100 border border-neutral-300">
                Display text
              </button>*/}

              <button onClick={disconnectArduino} className="cursor-pointer flex items-center justify-center p-2.5 rounded-full bg-neutral-100 border border-neutral-300">
                Disconnect
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
