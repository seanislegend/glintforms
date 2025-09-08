# @glint/ui

A comprehensive component library built with TypeScript, Tailwind CSS, and Base UI primitives. This package provides a collection of accessible, customisable UI components designed to be used across all apps.

Most of these components are based on the templated components from [ShadCN UI](https://ui.shadcn.com). There have been changes made, such as coding style and replacing [Radix UI](https://www.radix-ui.com/primitives) with [Base UI](https://base-ui.com/react).

The Stepper component, following the same rewrites as the ShadCN UI components, is from [REUI](https://reui.io/docs).


## Example usage

```tsx
import {Card, CardContent} from '@glint/ui/button'
import Button from '@glint/ui/button'

const MyComponent = () => {
    return (
        <Card>
            <CardContent>
                <p>A description of the component</p>
                <Button onClick={handleClick}>Click me</Button>
            </CardContent>
        </Card>
    )
}

export default MyComponent;
```

## Adding new components

New components should only be added if they are generic and can be easily reused across the monorepo.

1. Create your component in `src/components/`
2. Add the export to `package.json` exports field