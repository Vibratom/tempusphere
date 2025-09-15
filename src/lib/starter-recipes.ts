
export interface StarterRecipe {
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
}

export const starterRecipes: StarterRecipe[] = [
    {
        title: "Simple Tomato Pasta",
        description: "A quick and satisfying pasta dish that's perfect for a weeknight dinner. The foundation of many great Italian meals.",
        ingredients: `- 8 oz pasta (like spaghetti or penne)
- 1 tbsp olive oil
- 2 cloves garlic, minced
- 1 (28 oz) can crushed tomatoes
- 1 tsp dried oregano or basil
- Salt and pepper to taste
- Optional: Parmesan cheese for serving`,
        instructions: `1. Cook pasta according to package directions. Drain, reserving a little pasta water.
2. While pasta cooks, heat olive oil in a large skillet over medium heat. Add garlic and cook until fragrant, about 30 seconds.
3. Pour in the crushed tomatoes, add oregano/basil, salt, and pepper. Bring to a simmer and cook for 10-15 minutes, stirring occasionally.
4. Add the cooked pasta to the sauce. Toss to coat, adding a splash of reserved pasta water if it seems too thick.
5. Serve immediately, topped with Parmesan cheese if desired.`
    },
    {
        title: "Classic Grilled Cheese",
        description: "The ultimate comfort food. A perfectly golden and crispy sandwich with a gooey, melted cheese center.",
        ingredients: `- 2 slices of bread
- 2 slices of cheese (cheddar, American, or provolone work well)
- 1 tbsp butter, softened`,
        instructions: `1. Spread butter on one side of each slice of bread.
2. Place one slice of bread, butter-side down, in a non-stick skillet over medium heat.
3. Layer the cheese slices on the bread.
4. Top with the second slice of bread, butter-side up.
5. Grill for 3-4 minutes per side, until the bread is golden brown and the cheese is fully melted.`
    },
    {
        title: "Perfect Scrambled Eggs",
        description: "Learn the secret to fluffy, creamy scrambled eggs every time. A breakfast staple that's easy to master.",
        ingredients: `- 2 large eggs
- 2 tbsp milk or cream
- A pinch of salt and pepper
- 1/2 tbsp butter`,
        instructions: `1. Crack eggs into a small bowl. Add milk, salt, and pepper. Whisk until the mixture is uniform and slightly frothy.
2. Melt butter in a non-stick skillet over medium-low heat.
3. Pour the egg mixture into the skillet. Let it sit for about 20-30 seconds until the edges just begin to set.
4. Using a spatula, gently push the eggs from the edges toward the center.
5. Continue this gentle pushing motion until the eggs are mostly set but still slightly moist.
6. Remove from heat immediately and serve.`
    }
];
