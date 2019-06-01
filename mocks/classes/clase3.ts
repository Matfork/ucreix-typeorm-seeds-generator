const arr = [55, 50];

const func = {
  m1: (par: string) => {
    function print(par: string) {
      console.log(par);
    }

    print(par);
  }
};

export const c1 = arr;
export const c2 = func;

export const c3 = function primsa() {
  console.log("prisma func");
};
