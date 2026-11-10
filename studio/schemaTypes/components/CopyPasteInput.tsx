import { useCallback } from 'react'
import { Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { CopyIcon } from '@sanity/icons/Copy'
import { ClipboardIcon } from '@sanity/icons/Clipboard'
import { set, unset, type ObjectInputProps } from 'sanity'

// Copiar/colar um bloco inteiro do conteudo, para repetir o bloco na outra
// aba de idioma sem preencher campo a campo. O conteudo vai para a area de
// transferencia como JSON com uma marca por tipo de bloco, para o "Colar"
// so aceitar um bloco do mesmo tipo.

type Item = { _key?: string; [field: string]: unknown }

type Options = {
  /** tipo do bloco, usado na marca do JSON */
  type: string
  /** campos copiados */
  fields: string[]
  /** nome do bloco nas mensagens, ex.: "bloco de código" */
  label: string
}

const newKey = () => Math.random().toString(36).slice(2, 14)

// itens de array precisam de _key proprio no documento de destino
const withNewKeys = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map((item) =>
        item && typeof item === 'object' ? { ...(item as Item), _key: newKey() } : item
      )
    : value

export function createCopyPasteInput({ type, fields, label }: Options) {
  const mark = `personal-site/${type}`

  function CopyPasteInput(props: ObjectInputProps) {
    const { value, onChange, readOnly } = props
    const toast = useToast()

    const copy = useCallback(async () => {
      const data: Record<string, unknown> = {}
      fields.forEach((field) => {
        if (value?.[field] !== undefined) data[field] = value[field]
      })
      try {
        await navigator.clipboard.writeText(JSON.stringify({ [mark]: 1, data }))
        toast.push({
          status: 'success',
          title: `${label[0].toUpperCase()}${label.slice(1)} copiado`,
          description: `Abra um ${label} no outro idioma e use "Colar bloco".`,
        })
      } catch {
        toast.push({ status: 'error', title: 'Não foi possível copiar' })
      }
    }, [value, toast])

    const paste = useCallback(async () => {
      let data: Record<string, unknown> | undefined
      try {
        const parsed = JSON.parse(await navigator.clipboard.readText())
        if (parsed?.[mark] === 1) data = parsed.data
      } catch {
        // texto que nao e JSON: cai no aviso abaixo
      }
      if (!data) {
        toast.push({
          status: 'warning',
          title: 'Nada para colar',
          description: `Copie um ${label} antes.`,
        })
        return
      }

      const hasContent = fields.some((field) => {
        const current = value?.[field]
        return Array.isArray(current) ? current.length > 0 : Boolean(current)
      })
      if (hasContent && !window.confirm(`Substituir o conteúdo deste ${label} pelo copiado?`)) {
        return
      }

      onChange(
        fields.map((field) =>
          data[field] === undefined ? unset([field]) : set(withNewKeys(data[field]), [field])
        )
      )
      toast.push({ status: 'success', title: 'Bloco colado' })
    }, [value, onChange, toast])

    return (
      <Stack space={4}>
        <Card padding={2} radius={2} tone="transparent" border>
          <Flex align="center" gap={2} wrap="wrap">
            <Text size={1} muted style={{ flex: 1, minWidth: 160 }}>
              Repetir este bloco no outro idioma
            </Text>
            <Button icon={CopyIcon} text="Copiar bloco" mode="ghost" fontSize={1} padding={2} onClick={copy} />
            <Button
              icon={ClipboardIcon}
              text="Colar bloco"
              mode="ghost"
              fontSize={1}
              padding={2}
              onClick={paste}
              disabled={readOnly}
            />
          </Flex>
        </Card>
        {props.renderDefault(props)}
      </Stack>
    )
  }

  return CopyPasteInput
}
