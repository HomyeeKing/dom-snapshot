enum ActionType {
  ADD_NODES,
  REMOVE_NODES,
}

interface Action {
  type: ActionType;
}

interface NodeOptAction extends Action {
  parent: Node;
  addNodes?: NodeList; // add action
  removeNodes?: NodeList; // remove action
}

export class Monitor {
  private observer: MutationObserver;
  private actions: Action[] = [];
  //   private nodeIdMap = new WeakMap<Node, number>(); // save node->id
  //   private id = 0;

  constructor() {
    this.observer = new MutationObserver(this.mutationCallback);
  }

  start(
    t: Element | string = document.documentElement,
    opts?: MutationObserverInit
  ) {
    let target;
    if (typeof t === "string") {
      target = document.querySelector(t)!;
      if (!target) {
        throw new Error(
          `Can't find element with selector ${t}. Are you sure it exists?`
        );
      }
    } else {
      target = t;
    }

    const options = {
      subtree: true,
      childList: true,
      attributes: true,
      ...opts,
    };
    this.observer.observe(target, options);
  }
  mutationCallback: MutationCallback = (mutations, observer) => {
    console.log(mutations);

    for (const mutation of mutations) {
      this.handleMutation(mutation);
    }
  };

  handleMutation(mu: MutationRecord) {
    switch (mu.type) {
      case "childList":
        const action: NodeOptAction = {
          parent: mu.target,
          type: ActionType.ADD_NODES,
        };
        if (mu.addedNodes.length) {
          action.addNodes = mu.addedNodes;
        }
        if (mu.removedNodes.length) {
          action.type = ActionType.REMOVE_NODES;
          action.removeNodes = mu.removedNodes;
        }
        this.actions.push(action);

        break;

      default:
        break;
    }
  }

  replay(frame: HTMLIFrameElement | string) {
      console.log('action',this.actions);
      
    let iframe;
    if (typeof frame === "string") {
      iframe = document.querySelector<HTMLIFrameElement>(frame);
      if (!frame) {
        throw new Error(
          `Can't find frame with selector ${frame}. Are you sure it exists?`
        );
      }
    } else {
      iframe = frame;
    }

    const frameDoc = iframe?.contentDocument!.documentElement;
    const actions = this.actions;
    const fragment = document.createDocumentFragment();
    debugger
    for (const act of actions) {
      this.handleAction(act, fragment);
    }
    console.log(`fragment`, fragment)
    frameDoc?.append(fragment)
  }

  handleAction(act: Action, fragment: DocumentFragment) {
    switch (act.type) {
      case ActionType.ADD_NODES:
        this.performAddNode(act as NodeOptAction,fragment);
        break;

      default:
        break;
    }
  }

  performAddNode(act:NodeOptAction,fragment: DocumentFragment){
      fragment.append(act.parent)
  }
}

// export const createObserver = (
//   target: Element | string,
//   options?: MutationObserverInit
// ) => {
//   const actions: Action[] = [];
//   let resolvedTarget;
//   if (typeof target === "string") {
//     resolvedTarget = document.querySelector(target);
//     if (!resolvedTarget) {
//       throw new Error(
//         `Can't find element with selector ${target}. Are you sure it exists?`
//       );
//     }
//   } else {
//     resolvedTarget = target;
//   }

//   const resolvedOpts: MutationObserverInit = {
//     subtree: true,
//     childList: true,
//     attributes: true,
//     ...options,
//   };

//   function handleMutation(mu: MutationRecord) {
//     switch (mu.type) {
//       case "childList":
//         const parent = mu.target;

//         break;

//       default:
//         break;
//     }
//   }
//   const mutationCallback: MutationCallback = (mutations, observer) => {
//     console.log(mutations);

//     for (const mutation of mutations) {
//       handleMutation(mutation);
//     }
//   };
//   const observer = new MutationObserver(mutationCallback);

//   observer.observe(resolvedTarget, resolvedOpts);

//   return observer;
// };
