import sys
import heapq
from collections import Counter

# Use PyAudioWPatch with SpeechRecognition
import pyaudiowpatch as pyaudio
sys.modules["pyaudio"] = pyaudio
import speech_recognition as sr


# ----------- HUFFMAN TREE -----------
def make_codes(text):
    freq = Counter(text)
    heap = [[count, [char, ""]] for char, count in freq.items()]
    heapq.heapify(heap)

    if len(heap) == 1:
        return {heap[0][1][0]: "0"}, freq

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)

        for item in left[1:]:
            item[1] = "0" + item[1]

        for item in right[1:]:
            item[1] = "1" + item[1]

        heapq.heappush(heap, [
            left[0] + right[0],
            *left[1:],
            *right[1:]
        ])

    codes = {char: code for char, code in heap[0][1:]}
    return codes, freq


# ---------- SPEECH INPUT ----------
r = sr.Recognizer()

print("\n================================")
print("     HUFFMAN TEXT COMPRESSION")
print("================================")
print("\n🎙️ Speak your sentence...")

with sr.Microphone() as source:
    r.adjust_for_ambient_noise(source, duration=1)
    print("🎙️ Speak now...")
    audio = r.listen(source)

try:
    text = r.recognize_google(audio).lower()
    print("\nOriginal text:")
    print(text)

except sr.UnknownValueError:
    print("❌ Could not understand the speech.")
    sys.exit()

except sr.RequestError as e:
    print("❌ Speech recognition error:", e)
    sys.exit()


# ---------- HUFFMAN CODING ----------
codes, freq = make_codes(text)

print("\nCharacter Frequencies:")
for char, count in sorted(freq.items()):
    display = "SPACE" if char == " " else char
    print(f"{display!r:8} : {count}")

print("\nHuffman Codes:")
for char, code in sorted(codes.items()):
    display = "SPACE" if char == " " else char
    print(f"{display!r:8} : {code}")


# ---------- ENCODE ----------
encoded = "".join(codes[ch] for ch in text)
print("\nEncoded bits:")
print(encoded)


# ---------- DECODE ----------
reverse_codes = {code: char for char, code in codes.items()}

current = ""
decoded = ""

for bit in encoded:
    current += bit
    if current in reverse_codes:
        decoded += reverse_codes[current]
        current = ""

print("\nDecoded text:")
print(decoded)


# ---------- CALCULATIONS ----------
original_bits = len(text) * 8
compressed_bits = len(encoded)
saved_bits = original_bits - compressed_bits

compression_percentage = (1 - compressed_bits / original_bits) * 100
average_length = compressed_bits / len(text)

# Entropy
entropy = 0
for count in freq.values():
    p = count / len(text)
    entropy -= p * (p.bit_length() if False else __import__("math").log2(p))

efficiency = (entropy / average_length) * 100

print("\n================================")
print("       COMPRESSION RESULTS")
print("================================")

print(f"Characters              : {len(text)}")
print(f"Original bits (8-bit)   : {original_bits}")
print(f"Huffman bits            : {compressed_bits}")
print(f"Bits saved              : {saved_bits}")
print(f"Average code length     : {average_length:.3f} bits")
print(f"Entropy                 : {entropy:.3f} bits/character")
print(f"Efficiency              : {efficiency:.2f}%")
print(f"Compression             : {compression_percentage:.2f}%")

print("\n✅ Huffman encoding and decoding completed.")