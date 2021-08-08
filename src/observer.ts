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

const importNode = document.importNode.bind(document);

const getEle = <E extends Element = Element>(t: Element | string): E => {
  let target;
  if (typeof t === "string") {
    target = document.querySelector<E>(t)!;
    if (!target) {
      throw new Error(
        `Can't find element with selector ${t}. Are you sure it exists?`
      );
    }
  } else {
    target = t;
  }

  return target as E;
};

export class Monitor {
  private observer: MutationObserver;
  private actions: Action[] = [];
  private storeFragment: DocumentFragment;
  private replayFrame: HTMLIFrameElement;
  //   private nodeIdMap = new WeakMap<Node, number>(); // save node->id
  //   private id = 0;

  constructor(frame: HTMLIFrameElement | string) {
    this.observer = new MutationObserver(this.mutationCallback);
    this.storeFragment = document.createDocumentFragment();
    this.replayFrame = getEle<HTMLIFrameElement>(frame);
  }

  start(
    t: Element | string = document.documentElement,
    opts?: MutationObserverInit
  ) {
    const target = getEle(t);
    // store target element
    this.storeFragment.append(importNode(target, true));
    console.log(this.replayFrame);

    this.replayFrame.contentDocument!.documentElement.append(
      this.storeFragment
    );

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

  /**
   *
   * @param frame the frame to replay
   *  1. init the frame with the origin document(w/o any actions)
   *  2. replay the actions
   */
  replay(frame: HTMLIFrameElement | string) {
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
    frameDoc?.appendChild(this.storeFragment);

    for (const act of actions) {
      this.handleAction(act);
    }
    setTimeout(() => {
      frameDoc?.appendChild(this.storeFragment);
    }, 3000);
  }

  handleAction(act: Action) {
    switch (act.type) {
      case ActionType.ADD_NODES:
        this.performAddNode(act as NodeOptAction);
        break;

      default:
        break;
    }
  }

  performAddNode(act: NodeOptAction) {
    // TODO: record the parent tag id or name to accurate get the parent element
    // then do DOM operation
    this.storeFragment.append(importNode(act.parent, true));
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
