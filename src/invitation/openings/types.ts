export interface OpeningProps {
    // Called on the first user gesture (unlocks audio playback on every browser).
    onBegin: () => void;
    onOpened: () => void;
}
