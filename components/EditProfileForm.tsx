import React from 'react';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { schema as updateProfileSchema } from '../endpoints/users/profile/update_POST.schema';
import styles from './EditProfileForm.module.css';

type EditProfileFormValues = z.infer<typeof updateProfileSchema>;

interface EditProfileFormProps {
  initialValues: EditProfileFormValues;
  onSubmit: (values: EditProfileFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const form = useForm({
    schema: updateProfileSchema,
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormItem name="displayName">
          <FormLabel>Display Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Your display name"
              value={form.values.displayName ?? ''}
              onChange={(e) => form.setValues((prev) => ({ ...prev, displayName: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="bio">
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Tell us about yourself"
              value={form.values.bio ?? ''}
              onChange={(e) => form.setValues((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="avatarUrl">
          <FormLabel>Avatar URL</FormLabel>
          <FormControl>
            <Input
              placeholder="https://example.com/avatar.png"
              value={form.values.avatarUrl ?? ''}
              onChange={(e) => form.setValues((prev) => ({ ...prev, avatarUrl: e.target.value }))}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};