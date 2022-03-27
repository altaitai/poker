function define(name, value) {
  Object.defineProperty(exports, name, {
      value:      value,
      enumerable: true
  });
}

define("suits", [
  "clubs", 
  "diamonds", 
  "hearts", 
  "spades"
]);

define("ranks", [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
  "ace"
]);

