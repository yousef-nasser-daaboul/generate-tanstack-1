<script setup lang="ts">
const typeValue = ref("");
const charIndex = ref(0);
const typeArrayIndex = ref(0);
const typingSpeed = ref(200);
const erasingSpeed = ref(200);
const newTextDelay = ref(2000);
const typeStatus = ref(false);
const typeArray = ref([
  "Free Syria",
  "Long live Syria",
  "Down with Assad",
  "Hope never dies",
  "Freedom for all",
  "Power to the people",
  "Justice for Syria",
  "Syria will rise again",
  "The truth is louder",
  "May God protect Syria",
  "May God grant victory to Syria",
  "May God bless Syria with peace",
  "May God have mercy on Syria's martyrs",
  "May God grant freedom to Syria",
]);

function typeText() {
  if (charIndex.value < typeArray.value[typeArrayIndex.value].length) {
    if (!typeStatus.value) typeStatus.value = true;

    typeValue.value += typeArray.value[typeArrayIndex.value].charAt(
      charIndex.value
    );
    charIndex.value += 1;

    setTimeout(typeText, typingSpeed.value);
  } else {
    typeStatus.value = false;
    setTimeout(eraseText, newTextDelay.value);
  }
}
function eraseText() {
  if (charIndex.value > 0) {
    if (!typeStatus.value) typeStatus.value = true;

    typeValue.value = typeArray.value[typeArrayIndex.value].substring(
      0,
      charIndex.value - 1
    );
    charIndex.value -= 1;
    setTimeout(eraseText, erasingSpeed.value);
  } else {
    typeStatus.value = false;
    typeArrayIndex.value += 1;
    if (typeArrayIndex.value >= typeArray.value.length)
      typeArrayIndex.value = 0;

    setTimeout(typeText, typingSpeed.value + 1000);
  }
}

setTimeout(typeText, newTextDelay.value + 200);
</script>

<template>
  <div class="container mb-5">
    <h1 class="text-4xl font-bold text-type">
      <span class="typed-text">{{ typeValue }}</span>
      <span class="cursor" :class="{ typing: typeStatus }">&nbsp;</span>
    </h1>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  display: flex;
}

.text-type {
  font-size: 1.5rem;
  font-weight: normal;
}

.text-type .typed-text {
  color: #4ade80;
}

.text-type .cursor {
  display: inline-block;
  margin-left: 3px;
  width: 4px;
  background-color: #fff;
  animation: cursorBlink 1s infinite;
}

.text-type .cursor.typing {
  animation: none;
}

@keyframes cursorBlink {
  49% {
    background-color: #fff;
  }
  50% {
    background-color: transparent;
  }
  99% {
    background-color: transparent;
  }
}
</style>
