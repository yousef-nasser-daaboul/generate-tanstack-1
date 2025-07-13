<script setup lang="ts">
const typeValue = ref("");
const charIndex = ref(0);
const typeArrayIndex = ref(0);
const typingSpeed = ref(200);
const erasingSpeed = ref(200);
const newTextDelay = ref(2000);
const typeStatus = ref(false);
const typeArray = ref([
  `"It works on my machine." – The developer's national anthem.`,
  `"Just gonna write a quick loop..." – Famous last words before crashing the system.`,
  `"[] == ![] // true" – JavaScript is not a bug, it's a feature.`,
  `"Why is this not working?" → "Oh." → "Wait, why *is* this working?" – The debugging cycle.`,
  `"fix bug", "fix real bug", "fix actual real bug", "final fix", "please work" – Git commit history in a nutshell.`,
  `"Me: I'll refactor this later" – *Codebase, 5 years later: a haunted mess*`,
  `"1% writing code, 99% Stack Overflow"`,

  `"Interview question: 'What is your experience with React?' – Me: 'I watched a YouTube tutorial last night.'"`,

  `"// Don’t touch this. I don’t know how it works but it does." – Legacy code comment`,

  `"Dark mode is not a preference. It's a lifestyle."`,

  `"Normal people on weekends: party, movies, beach. Me: npm run dev"`,

  `"Programming is 90% figuring out why it doesn’t work and 10% swearing it should work."`,
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
  <div class="relative container mb-16 w-full">
    <h1 class="text-4xl absolute w-full font-bold text-type">
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
  line-height: 2rem;
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
