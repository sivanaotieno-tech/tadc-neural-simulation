// Ribbit is a persistent Digital Circus character and is NOT abstracted.
export const RIBBIT = Object.freeze({
  id: 'ribbit',
  name: 'Ribbit',
  type: 'DIGITAL CIRCUS CHARACTER',
  scanStatus: 'ACTIVE',
  abstracted: false,
  permanent: true,
  description: 'Ribbit remains an active character in the Digital Circus and does not enter abstraction.',
  neuralProfile: {
    source: 'FICTIONAL CHARACTER PROFILE',
    persistent: true
  }
});

export function getRibbit() {
  return { ...RIBBIT, neuralProfile: { ...RIBBIT.neuralProfile } };
}
