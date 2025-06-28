import React, { useState } from 'react';
import * as z from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Switch } from './Switch';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { useCreateAd } from '../helpers/useAds';
import { schema as createAdSchema, AdTypeEnum } from '../endpoints/admin/ads_POST.schema';
import styles from './AdminAdCreateForm.module.css';

export const AdminAdCreateForm = () => {
  const createAdMutation = useCreateAd();

  const form = useForm({
    schema: createAdSchema,
    defaultValues: {
      title: '',
      type: 'promotional' as const,
      isActive: true,
      content: '',
      imageUrl: '',
      linkUrl: '',
    },
  });

  const adType = form.values.type;

  const onSubmit = (values: z.infer<typeof createAdSchema>) => {
    // Pass values unchanged - let discriminated union handle correctness
    createAdMutation.mutate(values, {
      onSuccess: () => {
        // Reset to promotional type with proper structure
        form.setValues({
          title: '',
          type: 'promotional' as const,
          isActive: true,
          content: '',
          imageUrl: '',
          linkUrl: '',
        });
      },
    });
  };

  const handleTypeChange = (value: string) => {
    if (value === 'script') {
      // Create brand-new script object
      form.setValues({
        title: form.values.title,
        type: 'script' as const,
        isActive: form.values.isActive,
        scriptCode: '',
      });
    } else if (value === 'promotional') {
      // Create brand-new promotional object
      form.setValues({
        title: form.values.title,
        type: 'promotional' as const,
        isActive: form.values.isActive,
        content: '',
        imageUrl: '',
        linkUrl: '',
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Create New Ad</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormItem name="type">
            <FormLabel>Ad Type</FormLabel>
            <FormControl>
              <RadioGroup
                value={adType}
                onValueChange={handleTypeChange}
                className={styles.radioGroup}
              >
                <div className={styles.radioItem}>
                  <RadioGroupItem value="promotional" id="promotional" />
                  <label htmlFor="promotional">Promotional</label>
                </div>
                <div className={styles.radioItem}>
                  <RadioGroupItem value="script" id="script" />
                  <label htmlFor="script">Script</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="title">
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Summer Sale"
                value={form.values.title}
                onChange={(e) => form.setValues((prev) => ({ ...prev, title: e.target.value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {adType === 'promotional' && (
            <>
              <FormItem name="content">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ad copy..."
                    value={form.values.content}
                    onChange={(e) => form.setValues((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="imageUrl">
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.png"
                    value={form.values.imageUrl || ''}
                    onChange={(e) => form.setValues((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="linkUrl">
                <FormLabel>Link URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/product"
                    value={form.values.linkUrl}
                    onChange={(e) => form.setValues((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </>
          )}

          {adType === 'script' && (
            <FormItem name="scriptCode">
              <FormLabel>Script Code</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="<script>...</script>"
                  value={form.values.scriptCode}
                  onChange={(e) => form.setValues((prev) => ({ ...prev, scriptCode: e.target.value }))}
                  rows={6}
                />
              </FormControl>
            </FormItem>
          )}

          <FormItem name="isActive">
            <div className={styles.switchContainer}>
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch
                  checked={form.values.isActive}
                  onCheckedChange={(checked) => form.setValues((prev) => ({ ...prev, isActive: checked }))}
                />
              </FormControl>
            </div>
            <FormDescription>
              Inactive ads will not be displayed.
            </FormDescription>
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={createAdMutation.isPending} className={styles.submitButton}>
            {createAdMutation.isPending ? 'Creating...' : 'Create Ad'}
          </Button>
        </form>
      </Form>
    </div>
  );
};