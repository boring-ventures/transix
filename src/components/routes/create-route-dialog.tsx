'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  name: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  price: z.string().refine((val) => !isNaN(Number(val))),
  departure_date: z.string(),
  departure_time: z.string()
})

export function CreateRouteDialog() {
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      origin: "",
      destination: "",
      price: "",
      departure_date: "",
      departure_time: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          name: values.name,
          origin: values.origin,
          destination: values.destination,
          price: parseFloat(values.price),
          departure_date: values.departure_date,
          departure_time: values.departure_time
        }])
        .select()

      if (error) {
        console.error('Error creating route:', error.message)
        return
      }

      form.reset()
      setOpen(false)
      window.location.reload()
    } catch (err) {
      console.error('Error creating route:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter route name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter origin location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter destination location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departure_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departure_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Create Route</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}