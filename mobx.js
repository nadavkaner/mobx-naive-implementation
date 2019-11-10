const stack = [];

function observable(initialValue) {
  let value = initialValue;
  const observers = [];
  return {
    subscribe(observer) {
      observers.push(observer);
    },
    unsubscribe(observer) {
      observers.splice(observers.indexOf(observer, 1));
    },
    get() {
      stack[stack.length - 1].addDependency(this);
      return value;
    },
    set(newValue) {
      value = newValue;
      observers.forEach(observer => observer.run());
    }
  };
}

function autorun(thunk) {
  const observing = [];
  const reaction = {
    addDependency(observable) {
      observing.push(observable);
    },
    run() {
      stack.push(this);
      observing.splice(0).forEach(o => o.unsubscribe(this));
      thunk();
      observing.forEach(o => o.subscribe(this));
      stack.pop();
    }
  };

  // first run
  reaction.run();
}

function computed(thunk) {
  const current = observable();
  autorun(() => {
    current.set(thunk());
  });
  return current;
}

// ************** Usage **************

const firstName = observable("nadav");
const lastName = observable("kaner");

const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);

autorun(() => {
  console.log(fullName.get());
});

firstName.set("Power");
lastName.set("Rangers");
