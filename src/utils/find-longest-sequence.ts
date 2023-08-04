interface meals {
  id: string
  user_id: string
  name: string
  description: string
  type: 'on_diet' | 'off_diet'
  time: string
}

export function findLongestSequence(
  meals: meals[],
  targetType: 'on_diet' | 'off_diet',
) {
  let longestSequence: meals[] = []
  let currentSequence: meals[] = []

  for (const meal of meals) {
    if (meal.type === targetType) {
      currentSequence.push(meal)
    } else {
      currentSequence = []
    }

    if (currentSequence.length > longestSequence.length) {
      longestSequence = [...currentSequence]
    }
  }

  return longestSequence
}
