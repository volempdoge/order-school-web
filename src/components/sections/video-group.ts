// The interview videos behave as one group: starting one pauses the others.
const players = new Set<HTMLMediaElement>();

export function registerPlayer(media: HTMLMediaElement) {
  players.add(media);
  const onPlay = () =>
    players.forEach((other) => {
      if (other !== media && !other.paused) other.pause();
    });
  media.addEventListener("play", onPlay);
  return () => {
    media.removeEventListener("play", onPlay);
    players.delete(media);
  };
}
