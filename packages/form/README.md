# @glint/form

A comprehensive form library built with TypeScript, Zod, React Hook Form, and our UI package. This package provides a collection of accessible, customisable form components designed to be used across all apps.


## Example usage

```tsx
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '@glint/form'
import {Input} from '@glint/form/input'
import {Button} from '@glint/ui/button'

const MyComponent = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {name: ''},
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="name"
                />
            </form>
        </Form>
    )
}

export default MyComponent;
```

When building a form, the schema should be defined in a separate file. This can then be used to generate the form fields and validation. This should be saved in the app that needs it.

## Adding new components

New components should only be added if they are generic and can be easily reused across the monorepo. If a component handles a specific use case or requires bundling of business logic, it should be added added directly to the app that needs it.

1. Create your component in `src/components/`
2. Add the export to `package.json` exports field