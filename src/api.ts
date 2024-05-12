export const fetchShippingCost = (
  weight: number,
  callBack: (value: number) => void
) => {
  const controller = new AbortController();
  fetch(`https://jsonplaceholder.typicode.com/photos/${weight}`, {
    signal: controller.signal,
  })
    .then((response) => response.json())
    .then((data) => callBack(data.id))
    .catch(() => {
      // Ignore errors for now since it's just a intentional request cancelation 😄
    });
  return () => controller.abort("Operation was aborted by the user");
};
