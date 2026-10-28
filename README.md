# flip.dev: Web Dev Flashcards

A flashcard app for revising HTML, CSS and JavaScript. Cards flip in 3D on click, and you move through the deck with next and previous buttons. Built with plain HTML, CSS and JavaScript, with no frameworks or build step.


## How to run

1. Keep `index.html`, `style.css` and `script.js` in the same folder.
2. Open `index.html` in any modern browser.

An internet connection is only needed for the Google Fonts. Without it, the page falls back to system fonts.

## Project structure

```
flashcards/
├── index.html   Page structure and the "add card" dialog
├── style.css    Colour palette, layout, 3D flip, themes, responsive rules
├── script.js    Card data, state, navigation, shuffle, progress, storage
└── README.md
```

## Features

**Required by the task**
- 15 flashcards stored as an array of `{ c, q, a }` objects (category, question, answer)
- Flip animation on click
- Next and previous navigation
- Progress indicator ("Card 3 of 15", a percentage and a progress bar)

**Extras**
- Shuffle the deck (Fisher–Yates algorithm)
- Filters: All, HTML, CSS, JavaScript, Custom, Bookmarked, To review
- "Got it" and "Review again" buttons to track what you have learned
- Bookmark any card with a star
- Add and delete your own cards
- Session stats: learned count, accuracy, streak and timer
- Deck complete screen with your score
- Dark and light themes (follows your system, with a manual toggle)
- Keyboard shortcuts
- Responsive layout and reduced-motion support
- Progress, bookmarks and custom cards are saved in the browser with `localStorage`

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next card |
| `Space` or `Enter` | Flip card |
| `Y` / `N` | Got it / Review again (after flipping) |
| `B` | Bookmark card |
| `S` | Shuffle deck |

## How it works

**Flip animation (CSS).** The scene has `perspective`, and the card inside has `transform-style: preserve-3d`. Adding the `.flipped` class applies `transform: rotateY(180deg)`. Both faces are positioned on top of each other with `backface-visibility: hidden`, and the back face is pre-rotated by 180°, so only one side shows at a time.

**State (JavaScript).** The app tracks:
- `deck`: the ids of the cards currently shown, after filtering
- `pos`: the index of the current card in `deck`
- `known` and `stars`: sets of card ids, saved to `localStorage`
- `session`: tries, correct answers, streak and start time

**Progress.** The progress bar is `(pos + 1) / deck.length`, shown as a percentage.

**Shuffle.** Fisher–Yates loops from the end of the array and swaps each item with a random item at or before it. This gives every order an equal chance, unlike `sort(() => Math.random() - .5)`, which is biased.

## Interview questions

**How would you implement a flip animation with CSS?**
Set `perspective` on the parent and `transform-style: preserve-3d` on the card. Place the front and back faces absolutely, give both `backface-visibility: hidden`, rotate the back face 180° and toggle `rotateY(180deg)` on the card.

**How would you track progress through the deck?**
Keep the current index in state and compute `(index + 1) / deck.length`. Update the counter and bar each time the index changes.

**How would you shuffle the card order?**
Use the Fisher–Yates algorithm on a copy of the deck, then reset the index to 0.

## Ideas for next steps

- Import and export cards as JSON
- Spaced repetition, so missed cards come back sooner
- Swipe gestures on mobile
- More decks (Git, React, SQL)

## 👩‍💻 Author

Priya Tambe
